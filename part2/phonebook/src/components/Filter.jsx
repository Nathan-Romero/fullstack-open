let Filter = ({ searchTerm, handleSearchChange }) => (
  <>
    filter shown with <input
          value={searchTerm}
          onChange={handleSearchChange}
        />
  </>
)

export default Filter