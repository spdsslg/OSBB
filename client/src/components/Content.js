import CompanyDescription from './CompanyDescription';
import './Content.css';
import Slider from './Slider';

const Content = ({ loggedInUser }) => {
  return (
    <>
      <Slider />
      <CompanyDescription/>
      {loggedInUser && <p>Logged in as: {loggedInUser}</p>}
    </>
  );
};

export default Content;
