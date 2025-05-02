let Filter = ({ searchTerm, handleSearchChange }) => (
  <>
    find countries <input
          value={searchTerm}
          onChange={handleSearchChange}
        />
  </>
)

export default Filter