import React, { Component, useState, useEffect } from "react";
import { toBN } from 'starknet/dist/utils/number';
import styles from "../styles/Modal.module.css";

import { DEVICE_TYPE_FULL_NAME_MAP } from './ConstantDeviceTypes'
import { MANUFACTURING_REQUIREMENT } from './ConstantManufacturingRequirement'

import { InventoryList } from "./InventoryList"
import { DeployDeviceInterface } from './ActionDeployDevice'
import { PickupDeviceInterface } from './ActionPickupDevice'
import { PickupUtxInterface } from './ActionPickupUtx'
import { DeployUtxInterface } from './ActionDeployUtx'
import { BuildDeviceInterface } from './ActionBuildDevice'
import { LaunchNdpeInterface } from './ActionLaunchNdpe'
import { TransferDeviceInterface } from './ActionTransferDevice'
import Image from "next/image";
import closeSvg from "../public/close.svg"

import {
    useStardiscRegistryByAccount
} from '../lib/api'

// Refs:
// https://stackoverflow.com/questions/54880669/react-domexception-failed-to-execute-removechild-on-node-the-node-to-be-re
// https://stackoverflow.com/questions/54276832/react-how-to-display-a-modal-popup-only-for-that-specific-div
// https://stackoverflow.com/questions/24502898/show-or-hide-element-in-react
// https://medium.com/@ralph1786/using-css-modules-in-react-app-c2079eadbb87

function feltLiteralToString (felt) {

    const tester = felt.split('');

    let currentChar = '';
    let result = "";
    const minVal = 25;
    const maxval = 255;

    for (let i = 0; i < tester.length; i++) {
        currentChar += tester[i];
        if (parseInt(currentChar) > minVal) {
            result += String.fromCharCode(currentChar);
            currentChar = "";
        }
        if (parseInt(currentChar) > maxval) {
            currentChar = '';
        }
    }

    return result
}

export function Modal (props) {

    //
    // Build information to be shown in popup window
    //
    const { info, pendingPickups } = props
    var title = ""
    var grids = ""
    var display_left_top = null
    var display_left_bottom = null
    var options = []
    var bool_display_left_bottom = true

    //
    // React states
    //
    const [hoverDevice, setHoverDevice] = useState ('-')

    //
    // Deal with stardisc handle query
    //
    let queryAccount = '0'
    let ownerShown = 'loading'
    if ((props.show) && (info.mode != 'transfer') && (info.mode != 'inventory') && (info['grids'].length == 1)) {
        const grid = info['grids'][0]
        const grid_str = `(${grid.x},${grid.y})`
        if (grid_str in props.gridMapping) {
            const grid_info = props.gridMapping [grid_str]
            const owner_bn = grid_info ['owner_bn']
            queryAccount = owner_bn.toString(10)

            //
            // set ownerShown to abbreviated hexstring first; if query comes back found below, overwrite with stardisc handle
            //
            const owner_hexstr = owner_bn.toString(16);
            const owner_hexstr_abbrev =
                "0x" + owner_hexstr.slice(0, 3) + "..." + owner_hexstr.slice(-4);
            ownerShown = owner_hexstr_abbrev
        }
    }
    const { data: db_stardisc_query } = useStardiscRegistryByAccount (queryAccount)

    if (db_stardisc_query && (db_stardisc_query.stardisc_query.length > 0)) {
        // console.log ("db_stardisc_query.stardisc_query[0]: ", db_stardisc_query.stardisc_query[0])
        const name = toBN(db_stardisc_query.stardisc_query[0].name).toString(10)
        const name_string = feltLiteralToString (name)
        ownerShown = name_string
    }

    //
    // Construct content
    //
    if (!props.show) return;
    var thead = [
        <th key='resource' style={{textAlign:'left',paddingLeft:'0'}}>Resource</th>,
        <th key='balance' style={{textAlign:'left',paddingLeft:'3em'}}>Balance</th>
    ]

    if (info.mode == 'transfer') {
        title += "Transfer device peer-to-peer"
        grids = ""
        options.push (<TransferDeviceInterface />)
    }
    else if (info.mode == 'inventory') {
        title += "Inventory"
        grids = ""
        // options.push (<TransferDeviceInterface />)
    }
    else {
        //
        // Multiple grid selected
        //
        if (info['grids'].length > 1) {
            title = `Selected ${info['grids'].length} grids:`
            for (const grid of info['grids']) {
                grids += `(${grid.x},${grid.y})`
            }

            options.push (<DeployUtxInterface grids={info['grids']} type={12} onDeployStarted={props.onDeployStarted} />)
            options.push (<DeployUtxInterface grids={info['grids']} type={13} onDeployStarted={props.onDeployStarted} />)
        }

        //
        // Single grid selected
        //
        else {
            title += "Selected 1 grid:"
            const grid = info['grids'][0]
            const grid_str = `(${grid.x},${grid.y})`
            const grid_mapping = props.gridMapping
            grids += grid_str

            //
            // Gather information about this grid;
            // construct option
            //
            var content1 = ''
            var content2 = ''
            if (grid_str in grid_mapping) {
                const grid_info = grid_mapping [grid_str]
                const owner = ownerShown

                const typ   = DEVICE_TYPE_FULL_NAME_MAP [grid_info ['type']]
                const balances = grid_info ['balances']

                const id = grid_info ['id']
                const isPendingPickup = pendingPickups.some (p => p.id === id)

                content1 += `Device type: ${typ}\n`
                content2 += `Owner: ${owner}`

                const CELL_HEIGHT = '2em'
                var tbody = []
                const requirement = MANUFACTURING_REQUIREMENT [hoverDevice]
                if (balances) {
                    for (var key of Object.keys(balances)) {

                        if (! ['Solar Power Generator', 'Nuclear Power Generator', 'Factory', 'Engine'].includes(typ)) { // only these types need to display energy balance
                            if (key === 'energy') {
                                continue;
                            }
                        }

                        var cell = []
                        cell.push (<td key={`manufacture-key-${key}`} style={{height:CELL_HEIGHT,textAlign:'left',paddingLeft:'0'}}>{key}</td>)
                        cell.push (<td key={`manufacture-balance-${key}`} style={{height:CELL_HEIGHT,textAlign:'left',paddingLeft:'3em'}}>{balances[key]}</td>)

                        if (['Factory'].includes(typ)) { // only UPSF needs to display manufacture requirement info
                            if (hoverDevice == '-') {
                                cell.push (<td key={`dash-${key}`} style={{height:CELL_HEIGHT,textAlign:'left',paddingLeft:'3em'}}>{'-'}</td>)
                            }
                            else {
                                //
                                // use hoverDevice to pull in resource & energy requirement
                                //
                                const requirement_color = balances[key] >= requirement[key] ? '#333333' : '#C34723'
                                cell.push (<td key={`manufacture-requirement-${key}`} style={{
                                    height:CELL_HEIGHT,
                                    textAlign:'left',
                                    paddingLeft:'3em',
                                    color:requirement_color
                                }}>{requirement[key]}</td>)
                            }
                        }

                        tbody.push (<tr key={key}>{cell}</tr>)
                    }
                }

                //
                // Generate options - actions to be performed by player
                //

                if (['Belt', 'Wire'].includes(typ)) {
                    bool_display_left_bottom = false
                    options.push(
                        <PickupUtxInterface
                            id={id}
                            grid_x={grid.x}
                            grid_y={grid.y}
                            typ={typ}
                            isPendingPickup={isPendingPickup}
                            onPendingPickup={props.onPendingPickup}
                        />
                    )
                }
                else {
                    options.push (
                        <PickupDeviceInterface
                            id={id}
                            grid_x={grid.x}
                            grid_y={grid.y}
                            typ={typ}
                            isPendingPickup={isPendingPickup}
                            onPendingPickup={props.onPendingPickup}
                        />
                    )
                }

                if (balances && ['Factory'].includes(typ)) {

                    var thead = [
                        <th key='upsf-resource' style={{textAlign:'left',paddingLeft:'0'}}>Resource</th>,
                        <th key='upsf-balance' style={{textAlign:'left',paddingLeft:'3em'}}>Balance</th>,
                        <th key='upsf-requirement' style={{textAlign:'left',paddingLeft:'3em'}}>Requirement</th>
                    ]

                    //
                    // Construct can_build for each device type
                    //
                    for (const i=0; i<16; i++){ // iterate over all device types
                        var can_build = true
                        for (var key of Object.keys(balances)) {
                            const have = balances[key]
                            const need = MANUFACTURING_REQUIREMENT[i][key]
                            if (have < need) {
                                can_build = false
                            }
                        }

                        options.push (
                            <BuildDeviceInterface typ={i} grid_x={grid.x} grid_y={grid.y} can_build={can_build} setHoverDeviceCallback={setHoverDevice} />
                        )
                    }

                }
                else if (['Engine'].includes(typ)) {
                    options.push (
                        <LaunchNdpeInterface grid_x={grid.x} grid_y={grid.y} />
                    )
                }
            }
            else {
                content1 += "Grid not populated"
                bool_display_left_bottom = false

                for (const i=0; i<16; i++) {
                    if ([12,13].includes(i)) { continue; }

                    const have_nonzero_balance = props.device_balance[i] > 0 ? true : false
                    // console.log (`device type ${i} have_nonzero_balance=${have_nonzero_balance}`)

                    options.push (
                        <DeployDeviceInterface
                            typ={i}
                            grid_x={grid.x}
                            grid_y={grid.y}
                            have_nonzero_balance={have_nonzero_balance}
                            onDeployStarted={props.onDeployStarted}
                        />
                    )
                }
            }

            //
            // Construct displayed information
            //
            display_left_top =
                <div>
                    <h3>Info</h3>
                    <p style={{fontSize:"0.9em"}}>{content1}</p>
                    <p style={{fontSize:"0.9em"}}>{content2}</p>
                </div>

            display_left_bottom =
                bool_display_left_bottom && (
                    <div>
                        <table style={{fontSize:"0.9em"}}>
                            <thead>
                                <tr>
                                    {thead}
                                </tr>
                            </thead>
                            <tbody>
                                {tbody}
                            </tbody>
                        </table>
                    </div>
                )

        }
    }

    var options_gated = []
    if (!props.account) {
        options_gated.push (<p key='no-account-signed'>no account signed in</p>)
    }
    else if (!props.in_civ) {
        options_gated.push (<p key='account-not-in-civ'>account not in this civilization</p>)
    }
    else {
        options_gated = options
    }

    const modal_left_child_style = {
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '0.6em',
        width: '20em'
    }

    const modal_right_child_style = {
        display: 'flex',
        order: 1,
        flexDirection: 'column',
        marginLeft: '2em',
        fontSize: '1em'
    }

    const non_inventory_left_view =
        <div style={modal_left_child_style}>
            <h3>{title}</h3>
            <p style={{fontSize:"0.9em",margin:'0'}}>{grids}</p>

            {display_left_top}
            {display_left_bottom}

            <div>&nbsp;</div>
        </div>

    const non_inventory_right_view =
            options.length > 0 ?
            <div style={modal_right_child_style}>
                <h3>Options:</h3>

                {options_gated}

            </div>
                :
            <></>

    const inventory_view =
        <div style={{width:'100%'}}>
            <h3>{title}</h3>

            <InventoryList
                onDeployUtx={props.onDeployUtx}
                onDeployDevice={props.onDeployDevice}
                inCiv={props.in_civ}
            />

            <div>&nbsp;</div>
        </div>

    const view = info.mode == 'inventory' ? inventory_view : [non_inventory_left_view, non_inventory_right_view]

    return (
        <div style={{display:'flex'}}>
            { props.show ?

            <div className={styles.modal}>
                <div className={styles.modalClose} onClick={props.onHide}>
                    <Image src={closeSvg} alt="close modal" />
                </div>

                {view}
            </div>

            : null }
        </div>
    );
}
