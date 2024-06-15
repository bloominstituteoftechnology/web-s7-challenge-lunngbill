import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import axios from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

export default function Form() {
const [form, setForm] = useState({
  fullName: '',
  size: '',
  toppings: []
})

const [error, setError] = useState({
  fullName: '',
  size: '',
  toppings: ''
})

const [ableToSubmit, setAbleToSubmit] = useState(false)

const [success,setSuccess] = useState('')
const [failure, setFailure] = useState(null)

// 👇 Here you will create your schema.
const validationSchema = yup.object().shape({
fullName: yup.string().trim()
  .min(3, validationErrors.fullNameTooShort)
  .max(20, validationErrors.fullNameTooLong)
  .required('Full name is required'),
size: yup.string()
  .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect)
  .required('Size is required'),
toppings: yup.array().of(yup.string()
  .oneOf(['1', '2', '3', '4', '5'])
  )
})


// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

const validateChange = (e) => {
  yup
  .reach(validationSchema, e.target.name)
  .validate(
    e.target.type === 'checkbox' ? e.target.checked : e.target.value
  )
  .then(() => {
    setError({ ...error, [e.target.name]: ''})
  })
  .catch((err) => {
    setError({ ...error, [e.target.name]: err.message})
  })
}

useEffect(() => {
  validationSchema.isValid(form).then((isValid) => {
    setAbleToSubmit(isValid)
  })
}, [form])

const handleChange = (e) => {
  e.persist()

  const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
  validateChange(e)

  if (e.target.type === 'checkbox') {
  setForm((prev) => {
    const updatedToppings = e.target.checked ? [...prev.toppings, e.target.name] : prev.toppings.filter((topping) => topping !== e.target.name)
    return { ...prev, toppings:updatedToppings}
    })
  } else {
    setForm({ ...form, [e.target.name]: value})
  }
}

const handleSubmit = (e) => {
  e.preventDefault()
  axios.post('http://localhost:9009/api/order', form)
  .then((res) => {
    setForm({
      fullName: '',
      size: '',
      toppings: []
  })
    setSuccess(res.data.message)
    setFailure(null)
  })
  .catch((err) => {
    setFailure(err.response.data.message)
    setSuccess(null)
  })
  }



  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input value={form.fullName} onChange={handleChange} name='fullName' placeholder="Type full name" id="fullName" type="text" />
        </div>
        {error.fullName && <div className='error'>{error.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select name='size' onChange={handleChange} id="size" value={form.size}>
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
          </select>
        </div>
        {error.size && <div className='error'>{error.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map((topping) => (
        <label key={topping.topping_id}>
          <input 
            onChange={handleChange}
            name={topping.topping_id}
            type="checkbox"
            checked={form.toppings.includes(topping.topping_id)}
          />
          {topping.text}<br />
        </label>
        ))}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!ableToSubmit}/>
    </form>
  )
}
