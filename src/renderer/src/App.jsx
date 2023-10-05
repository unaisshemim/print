import axios from 'axios'
import React, { useState } from 'react'




const App = () => {
  const [food, setFood] = useState(null)

  const getFood = async () => {
    // get the request
  await window.electron.ipcRenderer.invoke('test-print',{})
    // try {
    //   const response = await axios.get('http://localhost:3000/FoodCart')
    //   setFood(response.data)
    // } catch (error) {
    //   console.log(error)
    // }
  }

  console.log(food)
  return (
    <div style={{ color: 'white', backgroundColor: 'black', height: '100vh', margin: 0 }}>
      <button onClick={getFood}>click me</button>
    </div>
  )
}

export default App
