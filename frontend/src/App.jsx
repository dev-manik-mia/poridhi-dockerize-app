import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080")
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial",
        padding: "40px",
      }}
    >
      <h1>Frontend Running</h1>

      {data && (
        <div>
          <p>{data.message}</p>
          <p>Total Visits: {data.totalVisits}</p>
          <p>Cached Visits: {data.cachedVisits}</p>
        </div>
      )}
    </div>
  );
}