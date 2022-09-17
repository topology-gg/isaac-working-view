import React from "react";

import {
    useCivState,
    useMacroStates,
    usePlayerFungibleBalances,
} from "../lib/api";

export default function GameStatsCiv() {
    const { data: db_civ_state } = useCivState();
    const { data: db_macro_states } = useMacroStates();
    const { data: db_player_fungible_balances } = usePlayerFungibleBalances();

    if (!db_civ_state || !db_macro_states || !db_player_fungible_balances) {
        return;
    }

    return (
        <>
            {db_macro_states.macro_states.length === 0 ? (
                <>
                    <h4>Universe Stats</h4>
                    <p>{"** universe inactive **"}</p>
                </>
            ) : (
                <>
                    <h4>Universe - Civilization #{db_civ_state.civ_state[0].civ_idx}</h4>
                    <p>
                        Population:{" "}
                        {
                            db_player_fungible_balances.player_fungible_balances
                                .length
                        }
                    </p>
                    <p>
                        Universe age: {db_macro_states.macro_states.length - 1}{" "}
                        / 2520 ticks
                    </p>
                </>
            )}
        </>
    );
}
