import { css } from "@emotion/react"
import { useEffect, useRef, useState } from "react"
// @ts-ignore
import { WasmBoy } from "wasmboy"

const objectToArray = (obj: Record<number, number>): number[] => {
	const array: number[] = []
	for (const key in obj) {
		array[key] = obj[key]
	}
	return array
}

const App: React.FC = () => {
	const [playing, setPlaying] = useState(false)
	const directoryHandleRef = useRef<FileSystemDirectoryHandle>()
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		document.addEventListener("keydown", (e) => {
			WasmBoy.setJoypadState({
				UP: e.key === "ArrowUp",
				RIGHT: e.key === "ArrowRight",
				DOWN: e.key === "ArrowDown",
				LEFT: e.key === "ArrowLeft",
				A: e.key === "z",
				B: e.key === "x",
				SELECT: e.key === "Shift",
				START: e.key === "Enter",
			})
		})
		document.addEventListener("keyup", (e: any) => {
			WasmBoy.setJoypadState({
				UP: false,
				RIGHT: false,
				DOWN: false,
				LEFT: false,
				A: false,
				B: false,
				SELECT: false,
				START: false,
			})
		})
	}, [])

	return (
		<div
			css={css`
				width: 100vw;
				height: 100vh;
				background: #7700ff;
				padding: 24px;
			`}>
			<div
				css={css`
					display: block;
					margin: 20px auto;
					width: 300px;
				`}>
				<button
					onClick={async () => {
						directoryHandleRef.current = await window.showDirectoryPicker()
						const permission =
							await directoryHandleRef.current.requestPermission({
								mode: "readwrite",
							})

						console.log(permission)
						if (permission === "granted") {
							try {
								const rom = await directoryHandleRef.current.getFileHandle(
									"rom.gb"
								)
								WasmBoy.setCanvas(canvasRef.current!)

								const romFile = await rom.getFile()
								await WasmBoy.loadROM(romFile)
								const save = await directoryHandleRef.current.getFileHandle(
									"save.json",
									{
										create: false,
									}
								)
								const saveFile = await save.getFile()
								const json = await saveFile.text()
								const state = JSON.parse(json)
								await WasmBoy.loadState({
									...state,
									wasmboyMemory: {
										cartridgeRam: new Uint8Array(
											objectToArray(state.wasmboyMemory.cartridgeRam)
										),
										gameBoyMemory: new Uint8Array(
											objectToArray(state.wasmboyMemory.gameBoyMemory)
										),
										wasmBoyInternalState: new Uint8Array(
											objectToArray(state.wasmboyMemory.wasmBoyInternalState)
										),
										wasmBoyPaletteMemory: new Uint8Array(
											objectToArray(state.wasmboyMemory.wasmBoyPaletteMemory)
										),
									},
								})
								WasmBoy.disableDefaultJoypad()
								WasmBoy.play()
								setPlaying(true)
							} catch (error) {
								if (error instanceof Error) {
									console.error(error)
								}
							}
						}
					}}
					css={css`
						display: block;
						margin: auto;
						text-align: center;
						font-weight: bold;
						padding: 12px;
						background-color: lightgray;
						text-shadow: -1px -1px black, 1px 1px white;
						color: gray;
						border-radius: 8px;
						box-shadow: 0 0.2em gray;
						cursor: pointer;
						&:active {
							box-shadow: none;
							position: relative;
							top: 0.2em;
						}
					`}>
					PRESS HERE TO LOAD USB
				</button>
			</div>
			<div
				css={css`
					display: block;
					margin: auto;
					width: 400px;
					padding: 24px;
					background: #000;
					border-radius: 12px;
					position: relative;
				`}>
				{!playing && (
					<div
						css={css`
							position: absolute;
							top: 0;
							left: 0;
							width: 100%;
							height: 100%;
							display: grid;
							place-items: center;
						`}>
						<div
							css={css`
								color: #fff;
								animation: blinker 1s step-start infinite;
								@keyframes blinker {
									50% {
										opacity: 0;
									}
								}
							`}>
							INSERT USB
						</div>
					</div>
				)}
				<canvas
					ref={canvasRef}
					css={css`
						width: 100%;
						border-radius: 12px;
						aspect-ratio: 160 / 144;
					`}
				/>
			</div>
			<div
				css={css`
					display: flex;
					justify-content: space-between;
					margin: 20px auto;
					width: 400px;
				`}>
				<div
					css={css`
						flex: 1;
						position: relative;
					`}>
					<button
						onMouseDown={() =>
							WasmBoy.setJoypadState({
								UP: true,
								RIGHT: false,
								DOWN: false,
								LEFT: false,
								A: false,
								B: false,
								SELECT: false,
								START: false,
							})
						}
						onMouseUp={() =>
							WasmBoy.setJoypadState({
								UP: false,
								RIGHT: false,
								DOWN: false,
								LEFT: false,
								A: false,
								B: false,
								SELECT: false,
								START: false,
							})
						}
						css={css`
							transform: translate3d(0, 20%, 0);
							display: grid;
							place-items: center;
							margin: auto;
							width: 48px;
							height: 48px;
							text-shadow: -1px -1px black, 1px 1px white;
							font-size: 24px;
							color: #888;
							background-color: #333;
							border-radius: 50%;
							border-color: #333;
							box-shadow: 0 0.2em #333;
							cursor: pointer;
							&:active {
								box-shadow: none;
								position: relative;
								top: 0.2em;
							}
						`}>
						↑
					</button>
					<div
						css={css`
							display: flex;
							justify-content: center;
						`}>
						<button
							onMouseDown={() =>
								WasmBoy.setJoypadState({
									UP: false,
									RIGHT: false,
									DOWN: false,
									LEFT: true,
									A: false,
									B: false,
									SELECT: false,
									START: false,
								})
							}
							onMouseUp={() =>
								WasmBoy.setJoypadState({
									UP: false,
									RIGHT: false,
									DOWN: false,
									LEFT: false,
									A: false,
									B: false,
									SELECT: false,
									START: false,
								})
							}
							css={css`
								display: grid;
								place-items: center;
								margin: auto;
								width: 48px;
								height: 48px;
								text-shadow: -1px -1px black, 1px 1px white;
								font-size: 24px;
								color: #888;
								background-color: #333;
								border-radius: 50%;
								border-color: #333;
								box-shadow: 0 0.2em #333;
								cursor: pointer;
								&:active {
									box-shadow: none;
									position: relative;
									top: 0.2em;
								}
							`}>
							←
						</button>
						<button
							onMouseDown={() =>
								WasmBoy.setJoypadState({
									UP: false,
									RIGHT: true,
									DOWN: false,
									LEFT: false,
									A: false,
									B: false,
									SELECT: false,
									START: false,
								})
							}
							onMouseUp={() =>
								WasmBoy.setJoypadState({
									UP: false,
									RIGHT: false,
									DOWN: false,
									LEFT: false,
									A: false,
									B: false,
									SELECT: false,
									START: false,
								})
							}
							css={css`
								display: grid;
								place-items: center;
								margin: auto;
								width: 48px;
								height: 48px;
								text-shadow: -1px -1px black, 1px 1px white;
								font-size: 24px;
								color: #888;
								background-color: #333;
								border-radius: 50%;
								border-color: #333;
								box-shadow: 0 0.2em #333;
								cursor: pointer;
								&:active {
									box-shadow: none;
									position: relative;
									top: 0.2em;
								}
							`}>
							→
						</button>
					</div>
					<button
						onMouseDown={() =>
							WasmBoy.setJoypadState({
								UP: false,
								RIGHT: false,
								DOWN: true,
								LEFT: false,
								A: false,
								B: false,
								SELECT: false,
								START: false,
							})
						}
						onMouseUp={() =>
							WasmBoy.setJoypadState({
								UP: false,
								RIGHT: false,
								DOWN: false,
								LEFT: false,
								A: false,
								B: false,
								SELECT: false,
								START: false,
							})
						}
						css={css`
							transform: translate3d(0, -20%, 0);
							display: grid;
							place-items: center;
							margin: auto;
							width: 48px;
							height: 48px;
							text-shadow: -1px -1px black, 1px 1px white;
							font-size: 24px;
							color: #888;
							background-color: #333;
							border-radius: 50%;
							border-color: #333;
							box-shadow: 0 0.2em #333;
							cursor: pointer;
							&:active {
								box-shadow: none;
								position: relative;
								top: 0.2em;
							}
						`}>
						↓
					</button>
				</div>
				<div
					css={css`
						flex: 1;
						position: relative;
					`}>
					<button
						onMouseDown={() =>
							WasmBoy.setJoypadState({
								UP: false,
								RIGHT: false,
								DOWN: false,
								LEFT: false,
								A: true,
								B: false,
								SELECT: false,
								START: false,
							})
						}
						onMouseUp={() =>
							WasmBoy.setJoypadState({
								UP: false,
								RIGHT: false,
								DOWN: false,
								LEFT: false,
								A: false,
								B: false,
								SELECT: false,
								START: false,
							})
						}
						css={css`
							transform: translate3d(120%, 20%, 0);
							display: grid;
							place-items: center;
							margin: auto;
							width: 48px;
							height: 48px;
							text-shadow: -1px -1px black, 1px 1px white;
							font-size: 24px;
							color: #888;
							background-color: #333;
							border-radius: 50%;
							border-color: #333;
							box-shadow: 0 0.2em #333;
							cursor: pointer;
							&:active {
								box-shadow: none;
								position: relative;
								top: 0.2em;
							}
						`}>
						A
					</button>
					<button
						onMouseDown={() =>
							WasmBoy.setJoypadState({
								UP: false,
								RIGHT: false,
								DOWN: false,
								LEFT: false,
								A: false,
								B: true,
								SELECT: false,
								START: false,
							})
						}
						onMouseUp={() =>
							WasmBoy.setJoypadState({
								UP: false,
								RIGHT: false,
								DOWN: false,
								LEFT: false,
								A: false,
								B: false,
								SELECT: false,
								START: false,
							})
						}
						css={css`
							display: grid;
							place-items: center;
							margin: auto;
							width: 48px;
							height: 48px;
							text-shadow: -1px -1px black, 1px 1px white;
							font-size: 24px;
							color: #888;
							background-color: #333;
							border-radius: 50%;
							border-color: #333;
							box-shadow: 0 0.2em #333;
							cursor: pointer;
							&:active {
								box-shadow: none;
								position: relative;
								top: 0.2em;
							}
						`}>
						B
					</button>
				</div>
			</div>

			<div
				css={css`
					max-width: 300px;
					margin: 40px auto;
					display: flex;
					justify-content: center;
					gap: 20px;
				`}>
				<button
					onMouseDown={() =>
						WasmBoy.setJoypadState({
							UP: false,
							RIGHT: false,
							DOWN: false,
							LEFT: false,
							A: false,
							B: false,
							SELECT: true,
							START: false,
						})
					}
					onMouseUp={() =>
						WasmBoy.setJoypadState({
							UP: false,
							RIGHT: false,
							DOWN: false,
							LEFT: false,
							A: false,
							B: false,
							SELECT: false,
							START: false,
						})
					}
					css={css`
						display: block;
						text-align: center;
						font-weight: bold;
						padding: 4px;
						background-color: #333;
						text-shadow: -1px -1px black, 1px 1px white;
						color: #888;
						border-radius: 8px;
						box-shadow: 0 0.2em #333;
						cursor: pointer;
						&:active {
							box-shadow: none;
							position: relative;
							top: 0.2em;
						}
					`}>
					SELECT
				</button>
				<button
					onMouseDown={() =>
						WasmBoy.setJoypadState({
							UP: false,
							RIGHT: false,
							DOWN: false,
							LEFT: false,
							A: false,
							B: false,
							SELECT: false,
							START: true,
						})
					}
					onMouseUp={() =>
						WasmBoy.setJoypadState({
							UP: false,
							RIGHT: false,
							DOWN: false,
							LEFT: false,
							A: false,
							B: false,
							SELECT: false,
							START: false,
						})
					}
					css={css`
						display: block;
						text-align: center;
						font-weight: bold;
						padding: 4px;
						background-color: #333;
						text-shadow: -1px -1px black, 1px 1px white;
						color: #888;
						border-radius: 8px;
						box-shadow: 0 0.2em #333;
						cursor: pointer;
						&:active {
							box-shadow: none;
							position: relative;
							top: 0.2em;
						}
					`}>
					START
				</button>
			</div>

			<button
				onClick={async () => {
					const state = await WasmBoy.saveState()
					await WasmBoy.play()
					const saveFile = await directoryHandleRef.current?.getFileHandle(
						"save.json",
						{
							create: true,
						}
					)
					const json = JSON.stringify(state)
					const writableStream = await saveFile?.createWritable()
					await writableStream?.write(json)
					await writableStream?.close()
				}}
				css={css`
					display: block;
					margin: auto;
					text-align: center;
					font-weight: bold;
					padding: 12px;
					background-color: lightgray;
					text-shadow: -1px -1px black, 1px 1px white;
					color: gray;
					border-radius: 8px;
					box-shadow: 0 0.2em gray;
					cursor: pointer;
					&:active {
						box-shadow: none;
						position: relative;
						top: 0.2em;
					}
				`}>
				💾 SAVE
			</button>
		</div>
	)
}

export default App
