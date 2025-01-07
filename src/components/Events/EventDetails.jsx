import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  const {
    data: event,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["event", { eventId: id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const {
    mutate,
    isPending: isDeletingPending,
    isError: isDeletingError,
    error: deletingError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "event"] });
      navigate("/events");
    },
  });

  function handleDelete() {
    mutate({ id });
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <LoadingIndicator />}
      {isError && (
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || "Failed to fetch events."}
        />
      )}
      {isDeletingError && (
        <ErrorBlock
          title="An error occurred"
          message={deletingError.info?.message || "Failed to delete event"}
        />
      )}
      {event && (
        <article id="event-details">
          <header>
            <h1>{event.title}</h1>
            <nav>
              {isDeletingPending && <span>Deleting...</span>}
              {!isDeletingPending && (
                <button onClick={handleDelete}>Delete</button>
              )}

              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img
              src={`http://localhost:3000/${event.image}`}
              alt={event.title}
            />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">EVENT LOCATION</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {event.date} at {event.time}
                </time>
              </div>
              <p id="event-details-description">{event.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
