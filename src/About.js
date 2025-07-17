import React from "react";

function About() {
  
  return (
    <div style={style}>
      <h2>About Page</h2>
      <p>Name: Mbongeni</p>
      <p>Surname: Mhlanga</p>
      <p>Age: 24</p>
      <p>Education: University of Johannesburg</p>
    </div>
  );
}

export default  About;
const style = {
    backgroundColor: '#78E8F8',
    color: '#222',
    padding: '30px',
    borderRadius: '8px'
  };
