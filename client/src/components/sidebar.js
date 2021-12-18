/*
 *  ==============================================================================
 *  File: sidebar.js
 *  Project: client
 *  File Created: Sunday, 12th December 2021 9:41:01 pm
 *  Author: Dillon Koch
 *  -----
 *  Last Modified: Sunday, 12th December 2021 9:41:11 pm
 *  Modified By: Dillon Koch
 *  -----
 * 
 *  -----
 *  Sidebar Component
 *  ==============================================================================
 */

import { ProSidebar, Menu, MenuItem, SubMenu, SidebarHeader } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import "../App.css"


function Sidebar(props) {
    // props.handleSubsectionClick()

    return (
        <ProSidebar className="sidebar">
            <SidebarHeader className="sidebarheader">
                Popquiznotes
            </SidebarHeader>
            <Menu iconShape="square">
                {props.classes.map((val1, index1) => {
                    return (
                        <SubMenu title={val1['Name']} key={index1}>
                            <div key={index1}>
                                {Object.keys(val1['Sections_dict']).map((val2, index2) => {
                                    return (
                                        <div key={index2}>
                                            <div key={index2}>
                                                <SubMenu title={val2} key={index2}>
                                                    <div>
                                                        {Object.values(val1['Sections_dict'][val2]).map((val3, index3) => {
                                                            return (
                                                                <div key={index3}>
                                                                    <MenuItem key={index3}>
                                                                        <button onClick={(event) => props.handleSubsectionClick(event, val1, val2, val3)} key={index3}>
                                                                            {val3}
                                                                        </button>
                                                                    </MenuItem>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </SubMenu>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </SubMenu>
                    )
                })}
            </Menu >
        </ProSidebar >
    )
}

export default Sidebar;
