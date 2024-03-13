import { useState } from "react";
import { Wrapper, Title, Form, Input, Switcher, Error, } from "../components/auth-components"
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import { FirebaseError } from "firebase/app";

function FindPassword() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false)
    const [email, setEmail] = useState("");
    const [error, setError] = useState("")

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { name, value } } = e;
        if (name === "email") {
            setEmail(value);
        }
    }

    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if (isLoading || email === "") return;
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            alert("Success sending email!");
            navigate("/login");
        } catch (e) {
            if (e instanceof FirebaseError) {
                setError(e.message)
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Wrapper>
            <Title>Find Password</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="email" value={email} placeholder="Email" type="text" required />
                <Input type="submit" value={isLoading ? "Loading..." : "Send to Email"} />
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                Already have an account?{" "}
                <Link to="/login">Login in &rarr;</Link>
            </Switcher>
            <Switcher>
                Don't have an account?{" "}
                <Link to="/create-account">Create one &rarr;</Link>
            </Switcher>
        </Wrapper>
    )
}

export default FindPassword