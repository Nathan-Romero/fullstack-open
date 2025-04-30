import Part from './Part.jsx'

const Content = ({ parts }) => (
  <div>
    {parts.map( part =>
      <Part key={part.id} part={part} />
    )}
  </div>
)

export default Content