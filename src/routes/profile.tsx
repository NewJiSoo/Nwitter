import styled from "styled-components"
import { auth, db, storage } from "./firebase"
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;

const AvatarUpload = styled.label`
    width: 80px;
    height: 80px;
    overflow: hidden;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg{
        width: 50px;
    }
`;

const AvatarImg = styled.img`
    width: 100%;
`;

const AvatarInput = styled.input`
    display: none;
`;

const Name = styled.span`
    font-size: 22px;
`;

const Tweets = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
`;

const EditName = styled.button`
    background-color: #eee;
    color: black;
    border: none;
    padding: 5px 5px;
    border-radius: 5px;
    cursor: pointer;
`;

const NameInput = styled.textarea`
    border: 1px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 14px;
    color: white;
    background-color: black;
    width: 30%;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    &::placeholder {
        font-size: 16px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;


export default function Profile() {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    // 배열로 호출되는 인터페이스를 갖게 되고 빈 비열로 시작
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [edit, setEdit] = useState(false);
    const [editName, setEditName] = useState("");

    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0]
            // 유저 프로필만 저장할 db 생성(avatar) 후 주소 저장
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            // 프로필 업로드 후 저장하고
            setAvatar(avatarUrl);
            // 업데이트 한다
            // 유저 아이디로 이미지를 저장하기 때문에 유저 한명당 하나의 이미지만 저장된다
            await updateProfile(user, {
                photoURL: avatarUrl
            });
        }
    };
    const fetchTweets = async () => {
        const tweetQuery = query(
            collection(db, "tweets"),
            // 필터링 기능
            // db에 저장된 userId와 user?.uid가 같은것만 필터링
            // 에러뜨면 에러 링크로 가서 (firebase) 저장 누르기
            where("userId", "==", user?.uid),
            orderBy("createAt", "desc"),
            limit(25)
        );
        // getDocs가 tweetQuery을 반환해줌
        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map(doc => {
            const { tweet, createAt, userId, username, photo } = doc.data();
            return {
                tweet, createAt, userId, username, photo, id: doc.id
            }
        });
        setTweets(tweets);
    };

    useEffect(() => {
        fetchTweets();
    }, []);

    const onClick = () => {
        if (!user) return;
        setEdit(true);
    }

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditName(e.target.value);
    }

    const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!user) return;
        if (!edit) return;
        try {
            await updateProfile(user, {
                displayName: editName
            });
        } catch (e) {
            console.log(e)
        } finally {
            setEdit(false);
        }
    }

    // {...tweet}는 객체의 모든 속성을 컴포넌트에 전달
    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
                {avatar ? (<AvatarImg src={avatar} />) :
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                }
            </AvatarUpload >
            <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
            {edit ?
                <>
                    <NameInput required rows={1}
                        maxLength={20}
                        onChange={onChange}
                        value={editName}
                    />
                    <EditName onClick={onSubmit}>저장 하기</EditName>
                </>
                :
                <>
                    <Name>
                        {user?.displayName ?? "Anonymous"}
                    </Name>
                    <EditName onClick={onClick}>이름 변경</EditName>
                </>
            }

            <Tweets>
                {tweets.map((tweet) =>
                    <Tweet key={tweet.id} {...tweet} />
                )}
            </Tweets>
        </Wrapper>
    );
}