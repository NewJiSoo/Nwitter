import styled from "styled-components"
import { ITweet } from "./timeline"
import { auth, db, storage } from "../routes/firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div`
  &:last-child {
    place-self: end;
  }
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
  position: relative;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const EditButton = styled.button`
  background-color: white;
  color: #1d9bf0;
  font-weight: 600;
  border: 1px solid #1d9bf0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const TextInput = styled.textarea`
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

const EditSubmit = styled.button`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const PhotoEditButton = styled.label`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    background-color: black;
    border: 1px solid #eee;
    color: white;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 5px;
    cursor: pointer;
`;

const PhotoEditInput = styled.input`
  display: none;
`;

function Tweet({ tweet, username, photo, userId, id }: ITweet) {
  const user = auth.currentUser;
  const [edit, setEdit] = useState(false);
  const [updateTweet, setUpdateTweet] = useState(tweet);
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const photoRef = ref(storage, `tweets/${user.uid}/${id}`);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdateTweet(e.target.value);
  }
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      if (files[0]?.size < 1024 * 1024) {
        setUpdateFile(files[0]);
      } else {
        alert("이미지가 너무 커요!")
      }
    }
  }
  const onDelete = async () => {
    const ok = confirm("정말 삭제하시겠습니까?")
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };
  const onEdit = () => {
    if (user?.uid !== userId) return;
    setEdit(true);
  };
  const onEditSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "tweets", id), { tweet: updateTweet })
      if (updateFile) {
        const result = await uploadBytes(photoRef, updateFile);
        const url = await getDownloadURL(result.ref);
        updateDoc(doc(db, "tweets", id), {
          photo: url
        });
      }
      setEdit(false);
      setUpdateFile(null);
    } catch (e) {
      console.log(e)
    }
  };

  useEffect(() => {
    setUpdateFile(null);
  }, [photo])

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {edit ?
          <TextInput required rows={5}
            maxLength={180}
            onChange={onChange}
            value={updateTweet} />
          : <Payload>{tweet}</Payload>}
        {user?.uid === userId ?
          <>
            {edit ? <EditSubmit onClick={onEditSubmit}>수정완료</EditSubmit> : <>
              <EditButton onClick={onEdit}>Edit</EditButton>
              <DeleteButton onClick={onDelete}>Delete</DeleteButton>
            </>}
          </>
          : null}
      </Column>
      <Column>
        {photo ? <Photo src={photo} /> : null}
        {edit ?
          <>
            <PhotoEditButton htmlFor="updateFile">
              {photo ? "사진 수정하기" :
                <>
                  {updateFile ? "추가완료!" : "사진 추가하기"}
                </>
              }
            </PhotoEditButton>
            <PhotoEditInput onChange={onFileChange} type="file" id="updateFile" accept="image/*" />
          </>
          : null}
      </Column>

    </Wrapper>
  )
}

export default Tweet