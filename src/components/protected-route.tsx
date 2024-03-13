// 로그인한 유저는 protected-route를 볼 수 있고
// 로그인하지 않은 경우 로그인 또는 계정 생성페이지로 이동

import { Navigate } from "react-router-dom";
import { auth } from "../routes/firebase"

// children은 컴포넌트내 부의 모든 것 
// -> 홈과 프로필을 ProtectedRoute가 감쌓기 때문에
// children은 홈과 프로필이 된다.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // auth.currentUser는 유저가 로그인했는지 여부를 알려줌
    // 로그인 되어있는 user의 값을 주거나 null을 넘김
    const user = auth.currentUser;
    if (!user) {
        return <Navigate to="/login" />;
    }

    return children
}

export default ProtectedRoute