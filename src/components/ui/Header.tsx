import Navbar from './Navbar';
import UserMenu from './UserMenu';

type HeaderProps = {
  title?: string;
};

const Header = (props: HeaderProps) => {
  return (
    <Navbar title={props.title} bgColor="bg-primary-700" dark>
      <UserMenu lightText />
    </Navbar>
  );
};

export default Header;
