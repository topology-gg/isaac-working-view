import React, { Component } from "react";
import { useForm } from "react-hook-form";

import {
    StarknetProvider,
    useStarknet,
    useStarknetInvoke
} from '@starknet-react/core'

import { BUTTON_LEFT_STYLE, BUTTON_LEFT_DISABLED_STYLE, INPUT_END_STYLE, TX_HASH_STYLE } from "./ActionStyles";
import { DEVICE_TYPE_FULL_NAME_MAP } from './ConstantDeviceTypes'
import { useUniverseContract } from "./UniverseContract";

export function BuildDeviceInterface (props) {

    const { account, connect } = useStarknet ()
    const { contract } = useUniverseContract ()
    const { data : data_player_upsf_build_fungible_device, invoke : invoke_player_upsf_build_fungible_device } = useStarknetInvoke ({
        contract,
        method: 'player_upsf_build_fungible_device'
    })
    const { data : data_player_upsf_build_nonfungible_device, invoke : invoke_player_upsf_build_nonfungible_device } = useStarknetInvoke ({
        contract,
        method: 'player_upsf_build_nonfungible_device'
    })
    const typ = props.typ
    const x = props.grid_x
    const y = props.grid_y

    const {
        register: registerBuildAmount,
        handleSubmit: handleSubmitBuildAmount,
        formState: { errors: errorsBuildAmount }
    } = useForm();

    const onSubmitBuildDevice = (data) => {
        if (!account) {
            console.log ('user wallet not connected yet')
        }
        else if (!contract) {
            console.log ('universe contract not connected')
        }
        else if (!props.can_build) {
            console.log ('cannot build this device')
        }
        else {
            const args = [
                {x:x, y:y},
                typ,
                data['amountRequired']
            ]
            console.log('submit build device tx with args:', args)

            if ([12,13].includes(props.typ)) {
                invoke_player_upsf_build_fungible_device ({ args: args })
            }
            else {
                invoke_player_upsf_build_nonfungible_device ({ args: args })
            }

        }
      }

    const data_to_show = data_player_upsf_build_fungible_device ? data_player_upsf_build_fungible_device : data_player_upsf_build_nonfungible_device
    const link_to_voyager = `https://goerli.voyager.online/tx/${data_to_show}`

    //
    // TODO: style button and enable/disable onclick callback depending on props.can_build
    //

    return (
        <div style={{display:'flex',flexDirection:'row'}}>

            <form onSubmit={handleSubmitBuildAmount(onSubmitBuildDevice)}>
                <input
                    type="submit"
                    value={`Build ${DEVICE_TYPE_FULL_NAME_MAP[typ]}`}
                    style={props.can_build ? BUTTON_LEFT_STYLE : BUTTON_LEFT_DISABLED_STYLE}
                    className='action-button'
                    onMouseOver = {
                        () => {
                            console.log (`mouse over: ${typ}`)
                            props.setHoverDeviceCallback(props.typ)
                        }
                    }
                    onMouseOut = {
                        () => {
                            // console.log (`mouse out: ${typ}`)
                            props.setHoverDeviceCallback('-')
                        }
                    }
                />

                <input style={INPUT_END_STYLE} placeholder="amount" {...registerBuildAmount("amountRequired", { required: true })} />
                {/* {errorsBuildAmount.amountRequired && <span> (This field is required) </span>} */}
                {/* <p>Error: {error || 'No error'}</p> */}
            </form>

            <div style={{paddingLeft:'10px',paddingTop:'0',paddingBottom:'0'}}>
                {
                    (data_player_upsf_build_fungible_device || data_player_upsf_build_nonfungible_device) && (
                        <div>
                            <a style={TX_HASH_STYLE} href={link_to_voyager} target="_blank" rel="noopener noreferrer">view on voyager</a>
                        </div>
                    )
                }
            </div>

        </div>
    );
}
