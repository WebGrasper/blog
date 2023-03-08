import './App.css';
import Footer from './components/footer/footer';
import Navbar from './components/navbar/navbar';

function App() {
  return (
    <div className="App">
      <Navbar />
      {/* Creating basic layout of landing page */}
      <div className='container'>
      <div className="menu-navbar">menu</div>
      <div className="menu">menu</div>
      <div className="main">main</div>
      <Footer/>
      </div>
    </div>
  );
}

export default App;
