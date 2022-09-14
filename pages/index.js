import React, { useState, useEffect } from "react";

import GameWorld from "../components/GameWorld";
import GameStatsPlayers from "../components/GameStatsPlayers"
import GameStatsCiv from "../components/GameStatsCiv"
import CoverArt from "../components/CoverArt"
import CoverArtBack from "../components/CoverArtBack"

import { ConnectWallet } from "../components/ConnectWallet.js"

import {
    useMacroStates
} from '../lib/api'

import {
  getInstalledInjectedConnectors,
  StarknetProvider,
} from '@starknet-react/core'
import DarkPanel from "../components/DarkPanel";

function Home() {

    const [universeActive, setUniverseActive] = useState (false)
    const { data: db_macro_states } = useMacroStates ()
    const [connectors, setConnectors] = useState ([])

    // Connectors are not available server side, so use an effect hook
    useEffect (() => {
        setConnectors (getInstalledInjectedConnectors())
    } , [])


    useEffect ( () => {
        if (!db_macro_states) {
            return
        }
        else {
            if (db_macro_states.macro_states.length > 0) {
                setUniverseActive (true)
            }
            else {
                setUniverseActive (false)
            }
        }
    }, [db_macro_states])

    return (
    <StarknetProvider connectors={connectors} >
        <CoverArtBack />
        <CoverArt />

        <audio id='sound-popup-open'  src='/sound-open.ogg'/>
        <audio id='sound-popup-close' src='/sound-close.ogg'/>

        <div className="mother-container">

            <div className="left-child-container">
                <GameWorld />
            </div>

            <div className="right-child-container" style={{display: universeActive?'flex':'none'}}>

                <div className="right-child-title">
                    <h3 className="game-title">
                        ISAAC
                    </h3>
                </div>
                <DarkPanel>
                    <h4>Account</h4>
                    <ConnectWallet />
                </DarkPanel>

                <DarkPanel>
                    <h4>Controls</h4>
                    <p>Choose display mode: press <kbd>1</kbd> to <kbd>6</kbd></p>
                    <p>Transfer device: press <kbd>7</kbd></p>
                    <p>Select grid(s): <kbd>LMB</kbd> click & drag</p>
                    <p>Pan: <kbd>RMB</kbd></p>
                    <p>Zoom: mouse wheel / press <kbd>c</kbd> to reset zoom</p>
                    <p>Hold <kbd>q</kbd> to highlight your own devices</p>
                    <p>Press <kbd>i</kbd> to open Inventory</p>
                </DarkPanel>

                <DarkPanel>
                    <GameStatsCiv />
                </DarkPanel>

                <DarkPanel>
                    <GameStatsPlayers universeActive={universeActive} />
                </DarkPanel>
            </div>

        </div>

    </StarknetProvider>
    )
}

export default Home;
