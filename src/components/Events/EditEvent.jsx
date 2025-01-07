import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const { state } = useNavigation();
  const { id } = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ["events", { eventId: id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 10000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     const queryKey = ["events", { eventId: id }];

  //     await queryClient.cancelQueries({ queryKey });
  //     const previousEvent = queryClient.getQueryData(queryKey);
  //     queryClient.setQueryData(queryKey, newEvent);

  //     return { previousEvent };
  //   },
  //   onError: (error, data, context) => {
  //     const queryKey = ["events", { eventId: id }];
  //     queryClient.setQueryData(queryKey, context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events"]);
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ id, event: formData });
    // navigate("../");
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="An error occurred"
          message={
            error.info?.message ||
            "Failed to fetch the event. Please check your inputs and try again later"
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending data... </p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  const { id } = params;

  return queryClient.fetchQuery({
    queryKey: ["events", { eventId: id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });
}

export async function action({ request, params }) {
  const { id } = params;

  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);

  await updateEvent({ id, event: updatedEventData });
  queryClient.invalidateQueries(["events"]); // one disadvantage is that we can no longer use optimistic approatch
  return redirect("../");
}
