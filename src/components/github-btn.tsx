import { GithubAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import styled from "styled-components"
import { auth } from "../routes/firebase";
import { useNavigate } from "react-router-dom";

const Button = styled.span`
    margin-top: 50px;
    background-color: white;
    font-weight: 500;
    width: 100%;
    color: black;
    padding: 10px 20px;
    border-radius: 50px;
    border: 0;
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const Logo = styled.img`
    height: 25px;
`;

export function GithubButton() {
    const navigate = useNavigate();
    const onClick = async () => {
        try {
            // 이때 cordova에서 가져오는게 아닌 auth에서 가져와야 함
            const provider = new GithubAuthProvider();
            // 팝업창 띄워서 로그인
            await signInWithPopup(auth, provider);
            // 깃헙 페이지로 이동해서 로그인
            // await signInWithRedirect(auth, provider);
            navigate("/");
        } catch (e) {
            console.log(e);
        }

    }
    return (
        <Button onClick={onClick}>
            <Logo src="/github-logo.svg" />
            Continue with Github
        </Button>
    )
}
