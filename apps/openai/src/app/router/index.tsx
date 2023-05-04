import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import BaseLayout from '../layout/Base';
import loadable from '@loadable/component';

const Home = loadable(() => import('../views/Home'));
const Chat = loadable(() => import('../views/Chat/index_new'));
const ChatList = loadable(() => import('../views/Chat/list'));
const Community = loadable(() => import('../views/Community'));
const My = loadable(() => import('../views/My'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<BaseLayout />}>
      <Route index path="" element={<Home />} />
      <Route path="chat" element={<Chat />} />
      <Route path="chatList" element={<ChatList />} />
      <Route path="community" element={<Community />} />
      <Route path="my" element={<My />} />
    </Route>
  )
)

export default router
