export const GreetJS = () => {
    const greet = (name) => {
    return "Hello, " + name + "!!";
  };
  
  return (
    <div>
      <p>{greet("John")}</p>
      <p>{greet(42)}</p>
    </div>
  )
}