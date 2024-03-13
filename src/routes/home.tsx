import styled from "styled-components"
import PostTweetForm from "../components/post-tweet-form"
import Timeline from "../components/timeline";

const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: scroll;
  grid-template-rows: 1fr 5fr;
  scrollbar-width: none;
`;

function Home() {
    return (
        <Wrapper>
            <PostTweetForm />
            <Timeline />
        </Wrapper>
    )
}

export default Home