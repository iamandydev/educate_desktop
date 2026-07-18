import bannerImg from "../../images/renny.png";
import "./Banner.css";

export default function Banner() {
  return (
    <div className="banner">
      <img src={bannerImg} alt="Educación" className="banner-img" />
      <div className="banner-text">
        <h1>Educación efectiva y amigable</h1>
        <p>Aprender es fácil y efectivo con nosotros.</p>
      </div>
    </div>
  );
}
