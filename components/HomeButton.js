import Link from "next/link";
import { Button } from "react-bootstrap";

const HomeButton = props => {
  return (
    <div className="col" style={{ marginTop: "1.5rem" }}>
      <Link href={props.baseUrl ? `${props.baseUrl}` : "/"}>
        <Button variant="primary" className="float-right">
          Home
        </Button>
      </Link>
    </div>
  );
};

export default HomeButton;
