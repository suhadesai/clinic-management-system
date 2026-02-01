import '../App.css'
import picture from '../assets/footer-logo_1.png'
import search from '../assets/search_logo.avif'

function Navbar({value, onChange}) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img className="navbar-logo" src={picture}></img>
        <h1 className="navbar-title">Comprehensive Neurology Center</h1>
      </div>

      <div className='searchBar'>
                <img className='searchLogo' src={search}></img>

                <input 
          type='text' 
          placeholder='Search representatives' 
          value={value}
          onChange={onChange}
        />
            </div>
      
    </nav>
  );
}

export default Navbar;