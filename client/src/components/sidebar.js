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

    return (
        <ProSidebar className="sidebar">
            <SidebarHeader className="sidebarheader">
                Popquiznotes
            </SidebarHeader>
            <Menu iconShape="square">
                {props.classes.map((val1, index) => {
                    return (
                        <SubMenu title={val1['Name']}>
                            <div>
                                {Object.keys(val1['Sections_dict']).map((val2, index) => {
                                    return (
                                        <div>
                                            <div>
                                                <SubMenu title={val2}>
                                                    <div>
                                                        {Object.values(val1['Sections_dict'][val2]).map((val3, index) => {
                                                            return (
                                                                <MenuItem>
                                                                    <a href="https://google.com" >{val3}</a>
                                                                </MenuItem>
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
            </Menu>
        </ProSidebar>
    )
}

export default Sidebar;
