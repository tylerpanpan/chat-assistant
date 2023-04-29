import { Box, Stack } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import moment from 'moment';

interface ChatListProps {
  allChats: any[];
	onChoose: (chat: any) => void;
	onDelete: (id: number) => void;
}

export function ChatList({
	allChats,
	onChoose,
	onDelete
}: ChatListProps) {
	return (
		<>
			<Box p={2} height="100%" overflow={"scroll"}>
				<Stack direction="column">
					{
						allChats.map((chat: any) => (
							<Box
								key={chat?.id}
								border="1px solid #dedede"
								borderRadius="4px"
								marginBottom={2}
							>
								<Box
									bgcolor={"rgba(0, 0, 0, .05)"}
									p={1}
									py={0.5}
									color="#303030"
									height="35px"
								>
									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<Box>{chat?.createdAt ? moment(chat?.createdAt).format('YYYY-MM-DD HH:mm:ss') : '未知'}</Box>
										<Box
											color="#666"
											sx={{ cursor: 'pointer' }}
											onClick={() => onDelete(chat?.id)}
										>
											<DeleteOutlineIcon fontSize="small" />
										</Box>
									</Stack>
								</Box>
								<Box
									p={1}
									sx={{ cursor: 'pointer' }}
									onClick={() => onChoose(chat)}
								>
									<Stack direction="column" spacing={1}>
										{
											chat.messages.length > 0 && chat.messages.slice(chat.messages.length - 2).map((message: any, index: number) => (
												<Box
													key={index}
													bgcolor={message.role === "user" ? "#e7f8ff" : "rgba(0, 0, 0, .05)"}
													borderRadius="10px"
													px={2}
													py={1}
													letterSpacing={"1.2px"}
												>
													<Box
														sx={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															display: '-webkit-box',
															WebkitLineClamp: 2,
															WebkitBoxOrient: 'vertical'
														}}
													>
														{message.content}
													</Box>
												</Box>
											))
										}
                    {
                      chat.messages.length === 0 && (
                        <Box textAlign="center">暂无数据</Box>
                      )
                    }
									</Stack>
								</Box>
							</Box>
						))
					}
				</Stack>
			</Box>
		</>
	)
}