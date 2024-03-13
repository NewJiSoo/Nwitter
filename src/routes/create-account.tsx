import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth } from "./firebase.ts"
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-components.ts";
import { GithubButton } from "../components/github-btn.tsx";



function CreateAccount() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { name, value } } = e;
        if (name === "name") {
            setName(value);
        } else if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        }
    }
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if (isLoading || name === "" || email === "" || password === "") return;
        try {
            setLoading(true);
            // await에서만 사용가능함 (async도 추가하자)
            // 이메일과 비밀번호 생성 함수 (firebase, 이메일, 비밀번호)
            const credentials = await createUserWithEmailAndPassword(auth, email, password);
            console.log(credentials.user);
            // 기존 가지고있던 사용자 이름 등록
            await updateProfile(credentials.user, { displayName: name })
            // 계정생성 완료 시 홈페이지로 이동
            navigate("/");
        } catch (e) {
            if (e instanceof FirebaseError) {
                setError(e.message)
            }
        } finally {
            setLoading(false);
        }

        console.log(name, email, password)
    }
    return (
        <Wrapper>
            <Title>Join 𝕏</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text" required />
                <Input onChange={onChange} name="email" value={email} placeholder="Email" type="text" required />
                <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required />
                <Input type="submit" value={isLoading ? "Loading..." : "Create Account"} />
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                Already have an account?{" "}
                <Link to="/login">Login in &rarr;</Link>
            </Switcher>
            <GithubButton />
        </Wrapper>
    )
}

export default CreateAccount