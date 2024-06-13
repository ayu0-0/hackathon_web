import { useState } from "react";

type FormProps = {
  onSubmit: (name: string, age: string) => void;
};

//テスト

const Form = (props: FormProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onSubmit(name, age);
  };

  return (
    <form style={{ display: "flex", flexDirection: "column" }} onSubmit={submit}>
      <label>Name: </label>
      <input
        type={"text"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></input>
      <label>Age: </label>
      <input
        type={"text"}
        style={{ marginBottom: 20 }}
        value={age}
        onChange={(e) => setAge(e.target.value)}
      ></input>
      <button type={"submit"}>POST</button>
    </form>
  );
};

export default Form;