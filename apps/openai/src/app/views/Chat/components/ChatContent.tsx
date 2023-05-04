import { Box, IconButton, Skeleton, Stack, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useFeedback } from "../../../components/Feedback";
import { useAuth } from "../../../provider/AuthProvider";
import { useAudio } from "../../../provider/AudioProvider";
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MarkdownIt from "markdown-it";
import mdKatex from "@traptitech/markdown-it-katex";
import mila from "markdown-it-link-attributes";
import hljs from "highlight.js";
import "katex/dist/katex.css";
import "highlight.js/styles/atom-one-dark.css";

interface ChatContentProps {
  chats: any[];
  userInfo: any;
	character?: any;
	onRecharge: () => void;
  onShare: () => void;
}

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

const mdi = new MarkdownIt({
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })

export function ChatContent({
	chats,
  userInfo,
	character,
	onRecharge,
  onShare
}: ChatContentProps) {
	const { showToast } = useFeedback();
	const { showLogin } = useAuth();
	const chatEndRef = useRef<HTMLDivElement>(null);
	const { tts, append } = useAudio();

	// 虚拟滚动相关
	const count = chats.length
	const virtualizer = useVirtualizer({
		count,
		getScrollElement: () => chatEndRef.current,
		estimateSize: () => 100,
		overscan: 10
	})
	const items = virtualizer.getVirtualItems()

	useEffect(() => {
    if (chatEndRef.current && chats.length) {
      // virtualizer.scrollToIndex(chats.length - 1)
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight + 300;
    }
  }, [chats, chatEndRef]);

	// 文本复制
	const copyText = (data: any) => {
    if (data.role === "assistant") {
      data.content && copyToClipboard(data.content);
    }
  };

	function copyToClipboard(text: string) {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text + `\nAI个人助理：https://grzl.ai/${userInfo?.username ? '?invite=' + userInfo?.id : ''}`;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    showToast("已拷贝到剪贴板");
  }

	const [currentPlayIndex, setCurrentPlayIndex] = useState<number | null>(null);
	const [playedText, setPlayedText] = useState<string | null>(null);
	const handlePlay = (index: number) => () => {
		const text = chats[index].content;
		setCurrentPlayIndex(index)
		setPlayedText(text)
		tts(text)
	}

	useEffect(()=> {
		if(currentPlayIndex && playedText && chats[currentPlayIndex]?.content !== playedText && character?.isAudioOutput) {
			const appendData = chats[currentPlayIndex]?.content.replace(playedText, '')
			setPlayedText(chats[currentPlayIndex]?.content)
			append(appendData)
		}
	},[chats, currentPlayIndex, playedText]);

	return (
		<>
			<Box ref={chatEndRef} p={2} height="100%" overflow={"scroll"}>
				<Box height={virtualizer.getTotalSize()}>
					<Stack direction="column" sx={{transform: `translateY(${items[0] ? items[0].start : 0}px)`}}>
						{items.map((virtualRow) => {
							if(chats[virtualRow.index].role === 'recharge'){
								return (
									<Box ref={virtualizer.measureElement} key={virtualRow.key} color="#303030" display="flex" justifyContent="center" alignItems="center" p={2}>
										余额不足，请前往<Typography variant="button" onClick={()=> onRecharge()} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>充值</Typography>
									</Box>
								)
							}
							if(chats[virtualRow.index].role === 'guest'){
								return (
									<Box ref={virtualizer.measureElement} key={virtualRow.key} color="#303030" display="flex" justifyContent="center" alignItems="center" p={2}>
										您已达到10次使用限制，请 <Typography variant="button" onClick={()=> showLogin()} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>登录</Typography> 或 <Typography variant="button" onClick={()=> showLogin(true)} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>注册</Typography>
									</Box>
								)
							}
              if(chats[virtualRow.index].role === 'gpt4limit') {
                return <Box ref={virtualizer.measureElement} key={virtualRow.key} >
                <Box color="#303030" display="flex" justifyContent="center" alignItems="center" p={2}>
                    您的GPT4使用次数已耗尽，请邀请好友注册或充值获得更多次数
                </Box>
                 <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography variant="button" onClick={onShare} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>复制邀请链接</Typography>  <Typography variant="button" onClick={()=> onRecharge()} style={{margin: '0 6px', fontSize: '16px', cursor: 'pointer', color: '#1976d2'}}>充值</Typography>
                 </Box>
                </Box>
              }
							return (
								<Box
									data-index={virtualRow.index}
									ref={virtualizer.measureElement}
									key={virtualRow.key}
									display={'flex'}
									py={2.5}
									ml={chats[virtualRow.index].role === "user" ? "auto" : 0}
									mr={chats[virtualRow.index].role === "user" ? 0 : "15%"}
								>
									<Box
										className="chat-wrap"
										width={'100%'}
										bgcolor={chats[virtualRow.index].role === "user" ? "#e7f8ff" : "rgba(0, 0, 0, .05)"}
										border="1px solid #dedede"
										borderRadius="10px"
										color="#24292f"
										px={2}
										py={1}
										letterSpacing={"1.2px"}
										position={'relative'}
									>
                    {
                      chats[virtualRow.index].role === "assistant" && character?.isAudioOutput && (
                        <Box className="chat-audio-wrap">
                          <IconButton onClick={ handlePlay(virtualRow.index)} size="small">
                            <HeadphonesIcon sx={{ color: '#1976d2', fontSize: '16px' }} />
                          </IconButton>
                        </Box>
                      )
                    }
										{chats[virtualRow.index].role === "assistant" && (
											<Box
												className="chat-actions"
											>
												<Typography variant="caption" className="action-btn" onClick={() => copyText(chats[virtualRow.index])}>复制</Typography>
												{/* <Typography variant="caption" className="action-btn" onClick={() => handleDeleteChat(chats[virtualRow.index])}>删除</Typography> */}
											</Box>
										)}
										{chats[virtualRow.index].loading ? (
											<Skeleton
												sx={{
													width: "210px",
													bgcolor: "grey.400",
												}}
											></Skeleton>
										) : (
											<Box className="chat-box" dangerouslySetInnerHTML={{__html: mdi.render(chats[virtualRow.index].content)}}></Box>
										)}
									</Box>
								</Box>
							)})
						}
					</Stack>
				</Box>
			</Box>
		</>
	)
}
