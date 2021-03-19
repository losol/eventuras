import {
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay
} from "@chakra-ui/react";

import { EmailEditor } from "..";
import React from "react";

interface EmailDrawerProps {
    isOpen: boolean,
    onClose: any,
    recipientGroups: string [],
}

const EmailDrawer = (props: EmailDrawerProps): JSX.Element => {

    return (
        <Drawer
            isOpen={props.isOpen}
            placement="right"
            onClose={props.onClose}
            size="xl"
        >
            <DrawerOverlay>
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">
                        Create a new email
            </DrawerHeader>

                    <DrawerBody>
                        <EmailEditor participantGroups={props.recipientGroups} />
                    </DrawerBody>

                    <DrawerFooter borderTopWidth="1px">
                        <Button variant="outline" mr={3} onClick={props.onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue">Submit</Button>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerOverlay>
        </Drawer>
    )
}

export default EmailDrawer;