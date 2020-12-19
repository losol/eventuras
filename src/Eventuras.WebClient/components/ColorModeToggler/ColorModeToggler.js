import { Button, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

import React from "react";
import { VisuallyHidden } from "@chakra-ui/visually-hidden";

function ColorModeToggler() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode}>
      <VisuallyHidden>Toggle light </VisuallyHidden>{" "}
      {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}

export default ColorModeToggler;
