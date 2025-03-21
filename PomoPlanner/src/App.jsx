import Calendar from "./components/Calendar";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
    <h1 className="text-3xl font-bold mb-5">PomoPlanner</h1>
      <Calendar />
    </div>
  );
}

export default App;
