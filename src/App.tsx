import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Layout from "./components/layout"
import Home from "./routes/home"
import Profile from "./routes/profile"
import Login from "./routes/login"
import CreateAccount from "./routes/create-account"
import styled, { createGlobalStyle } from "styled-components"
import reset from "styled-reset"
import { useEffect, useState } from "react"
import LoadingScreen from "./components/loading-screen"
import { auth } from "./routes/firebase"
import ProtectedRoute from "./components/protected-route"
import FindPassword from "./routes/find-password"

const router = createBrowserRouter([
  {
    path: "/",
    // 홈과 프로필 페이지는 모두 ProtectedRoute의 children으로 보내짐
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "profile",
        element: <Profile />
      }
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/create-account",
    element: <CreateAccount />
  },
  {
    path: "/find-password",
    element: <FindPassword />
  }
])

const GlobalStyles = createGlobalStyle`
  ${reset};
  *{
    box-sizing: border-box;
  }
  body{
    background-color: black;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

  }
`;

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const init = async () => {
    // firebase가 쿠키와 토큰을 읽고
    // 백엔드와 소통해서 로그인 여부를 확인하는 동안 
    // 기다리겠다는 것
    await auth.authStateReady();
    // 파이어베이스 기다리기 (로딩 페이지)
    setIsLoading(false);
  };
  useEffect(() => {
    init()
  }, [])

  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </Wrapper>
  )
}

export default App
