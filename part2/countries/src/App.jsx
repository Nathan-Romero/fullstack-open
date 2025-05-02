import { useState, useEffect } from 'react'
import axios from 'axios'
import Filter from './components/Filter'
import Countries from './components/Countries'
import CountryInfo from './components/CountryInfo'

const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [countries, setCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = countries.filter(country =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCountries(filtered)
    } else {
      setFilteredCountries([])
    }
  }, [searchTerm, countries])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const showCountry = (country) => {
    setFilteredCountries([country])
  }

  return (
    <div>
      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />

      {filteredCountries.length > 10 ? (
        <div>Too many matches, specify another filter</div>
      ) : filteredCountries.length === 1 ? (
        <CountryInfo country={filteredCountries[0]} />
      ) : (
        <Countries countries={filteredCountries} showCountry={showCountry} />
      )}
    </div>
  )
}

export default App