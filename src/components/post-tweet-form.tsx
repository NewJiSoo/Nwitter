import { addDoc, collection, updateDoc } from "firebase/firestore";
import { useState } from "react";
import styled from "styled-components"
import { auth, db, storage } from "../routes/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
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

const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const AttachFileInput = styled.input`
  display: none;
`;

const SubmitBtn = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

function PostTweetForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [tweet, setTweet] = useState("");
    // 타입스크립트 문법 File 혹은 null을 입력값으로 받을 수 있음
    const [file, setFile] = useState<File | null>(null);
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value)
    };
    const onFileChage = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 비구조화 할당
        // 객체를 선언과 동시에 사용하는 방법
        // 이 방법을 사용하지 않는다면 변수를 추가로 선언하고 초기화해야 한다.
        // const files = e.target.files;
        const { files } = e.target;
        if (files && files.length === 1) {
            if (files[0]?.size < 1024 * 1024) {
                setFile(files[0]);
            } else {
                alert("이미지가 너무 커요!")
            }
        }
    };
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // 이벤트의 기본 동작을 취소하는 경우 사용됨(새로고침)
        e.preventDefault();
        const user = auth.currentUser
        if (!user || isLoading || tweet === "" || tweet.length > 180) return;

        try {
            setIsLoading(true);
            // firebase에 포함된 document를 생성하는 함수
            // 어떤 document를 생성할지 지정해야 함
            // collection 안에 firebase db를 설정(db), 경로 넣기("tweets")
            // 그 다음 추가하고 싶은 데이터 넣기
            const doc = await addDoc(collection(db, "tweets"), {
                tweet,
                createAt: Date.now(),
                username: user.displayName || "Anonymous",
                userId: user.uid // 트윗을 삭제할 아이디 기록
            });
            if (file) {
                // 만약 document가 생성된 후 이미지를 지정했다면 아래 경로로 저장
                const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);
                const result = await uploadBytes(locationRef, file);
                // getDownloadURL의 결과값은 string을 반환하는 promise
                const url = await getDownloadURL(result.ref);
                // updateDoc함수는 업데이트할 document에 대한 참조와 업데이트할 데이터가 필요한데
                // document에 대한 참조는 doc에서 생성하고 반환하고 있다.
                updateDoc(doc, {
                    photo: url
                });
                // 정리
                // 1. locationRef = 사진을 저장할 스토리지와 사진 경로를 생성한다.
                // 2. result = 지정한 스토리지에 파일을 업로드 한다.
                // 3. url = 업로드된 파일의 경로를 찾는다
                // 4. updateDoc() = 데이터베이스에 새로운 필드를(photo) 생성하고 그것을 저장한다(url)
            }
            setTweet("");
            setFile(null);
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }


    };



    // htmlFor : html 레이블과 연결된 input 요소의 id를 지정하는 속성
    // html에서는 for을 쓰지만 jsx에서는 htmlFor을 사용한다.
    return (
        <Form onSubmit={onSubmit}>
            <TextArea required rows={5} maxLength={180} onChange={onChange} value={tweet} placeholder="What is happening?!" />
            <AttachFileButton htmlFor="file">{file ? "Photo added ✅" : "Add photo"}</AttachFileButton>
            <AttachFileInput onChange={onFileChage} type="file" id="file" accept="image/*" />
            <SubmitBtn type="submit" value={isLoading ? "Posting..." : "Post Tweet"} />
        </Form>
    )
}

export default PostTweetForm