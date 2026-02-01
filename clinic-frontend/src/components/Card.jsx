import picture from '../assets/footer-logo_1.png'
import { useNavigate } from 'react-router-dom';

function Card(props) {
  const navigate = useNavigate();

  const handleNav = (eachBasic) => {
    navigate('/basics', { state: eachBasic });
  }

  return (
    <div className="rep-card" onClick={() => handleNav(props.basics)}>
      <div className="card-image-wrapper">
        <img className="card-image" src={picture} alt={props.basics.repName} />
        <div className="card-overlay"></div>
      </div>
      
      <div className="card-body">
        <h3 className="card-title">{props.basics.repName}</h3>
        <p className="card-facility">{props.basics.facilityAndDrug}</p>
        <button className="card-delete" onClick={(e) => {e.stopPropagation()
                      if (window.confirm(`Delete ${props.basics.repName}?`)) {
                        props.onDelete(props.basics._id)
                      }
                    }}>✕</button>
      </div>
    </div>
  );
}

export default Card;