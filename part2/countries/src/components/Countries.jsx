const Countries = ({ countries, showCountry }) => {
  return (
    <div>
      {countries.length > 10 ? (
        <div>Too many matches, specify another filter</div>
      ) : countries.length === 1 ? (
        <CountryInfo country={countries[0]} />
      ) : (
        countries.map(country => (
          <div key={country.name.common}>
            {country.name.common}
            <button onClick={() => showCountry(country)}>show</button>
          </div>
        ))
      )}
    </div>
  )
}

export default Countries