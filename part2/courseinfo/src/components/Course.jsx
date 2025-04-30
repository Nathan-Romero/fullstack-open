import Header from './Header.jsx'
import Content from './Content.jsx'

const Course = ({ course }) => (
  <div>
    <Header course={course.name} />
    <Content parts={course.parts} />
    {/* <Total
      total={
        course.parts[0].exercises +
        course.parts[1].exercises +
        course.parts[2].exercises
      }
    /> */}
  </div>
)

export default Course