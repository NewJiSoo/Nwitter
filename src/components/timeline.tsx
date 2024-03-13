import { collection, limit,/*  getDocs, */ onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../routes/firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
    id: string,
    photo?: string,
    tweet: string,
    userId: string,
    username: string,
    createAt: number
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: scroll;
  scrollbar-width: none;
`;

function Timeline() {
    const [tweets, setTweets] = useState<ITweet[]>([]);

    useEffect(() => {
        let unsubscribe: Unsubscribe | null = null;
        const fetchTweets = async () => {
            const tweetsQuery = query(
                collection(db, "tweets"),
                orderBy("createAt", "desc"),
                limit(25)
            );

            // const snapshot = await getDocs(tweetsQuery);
            // 배열을 반환하는 map함수를 사용해서 트윗 배열 안에 아래 같은 문서 저장
            // const tweets = snapshot.docs.map(doc => {
            //     const { tweet, createAt, userId, username, photo } = doc.data();
            //     return { tweet, createAt, userId, username, photo, id: doc.id }
            // });

            //onSnapshot을 사용할 때는 비용을 지불해야한다.
            // 유저가 다른 화면을 보고있으면 작동하지 않게해주는것이 좋다.
            // onSnapshotdms unsubscribe(구독취소)함수를 반환한다.
            // 유저가 화면을 보고있지 않으면 굳이 업로드 할 필요가 없다
            unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
                const tweets = snapshot.docs.map((doc) => {
                    const { tweet, createAt, userId, username, photo } = doc.data();
                    return {
                        tweet, createAt, userId, username, photo, id: doc.id
                    };
                });
                setTweets(tweets);
            });
        }
        fetchTweets();
        return () => {
            // userEffect의 tear down, cleanup 기능을 사용하는 것
            // 유저가 화면을 보지 않을 때 값을 반환하면서 cleanup을 실시함
            unsubscribe && unsubscribe();
        }
    }, [])

    return (
        <Wrapper>
            {tweets.map(tweet => <Tweet key={tweet.id}{...tweet} />)}
        </Wrapper>
    )
}

export default Timeline