import React, { FC, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Navigation } from "../navigation";
import { useTheme } from "@mui/material/styles";
import { Menu, Close } from "@mui/icons-material";
import { Logo } from "../logo/logo";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectLoginUser } from "../../store/auth/selectors";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Wallet } from "lucide-react";

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      isMetaMask?: boolean;
    };
  }
}

interface WalletState {
  accounts: string[];
  isConnecting: boolean;
  error: string | null;
}

// Styled components
const StyledLogoLeaked = styled("img")({
  marginLeft: "20px",
  width: "200px",
});

const StyledWalletButton = styled("button")(({ theme }) => ({
  position: "relative",
  padding: "12px 24px",
  backgroundColor: "black",
  border: "1px solid #06b6d4", // cyan-500
  color: "#06b6d4",
  fontFamily: "monospace",
  borderRadius: "4px",
  transition: "all 0.3s",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "#164e63", // cyan-950
    color: "#22d3ee", // cyan-400
    borderColor: "#22d3ee",
    boxShadow: "0 0 20px rgba(34,211,238,0.4)",
  },
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
}));

const WalletButtonContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  marginLeft: theme.spacing(2),
}));

const ConnectWalletButton: FC = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    accounts: [],
    isConnecting: false,
    error: null,
  });
  const [isHovered, setIsHovered] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setWalletState((prev) => ({
        ...prev,
        error: "Please install MetaMask!",
      }));
      return;
    }

    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletState((prev) => ({
        ...prev,
        accounts: accounts as string[],
        isConnecting: false,
      }));
    } catch (error) {
      setWalletState((prev) => ({
        ...prev,
        error: "Failed to connect wallet",
        isConnecting: false,
      }));
    }
  };

  const disconnectWallet = () => {
    setWalletState((prev) => ({ ...prev, accounts: [], error: null }));
  };

  const isConnected = walletState.accounts.length > 0;

  return (
    <WalletButtonContainer>
      <StyledWalletButton
        onClick={isConnected ? disconnectWallet : connectWallet}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={walletState.isConnecting}
        sx={{
          bgcolor: isConnected ? "#164e63" : "black",
        }}
      >
        <Wallet
          style={{
            width: "20px",
            height: "20px",
            animation: walletState.isConnecting
              ? "spin 1s linear infinite"
              : "none",
          }}
        />
        <span
          style={{
            filter: isHovered ? "blur(0.5px)" : "none",
            color: isHovered ? "#67e8f9" : undefined,
          }}
        >
          {walletState.isConnecting
            ? "Connecting..."
            : isConnected
            ? `Connected: ${walletState.accounts[0].slice(
                0,
                6
              )}...${walletState.accounts[0].slice(-4)}`
            : "Connect Wallet"}
        </span>
      </StyledWalletButton>

      {walletState.error && (
        <Box
          sx={{
            position: "absolute",
            bottom: "-32px",
            left: 0,
            right: 0,
            color: "error.main",
            fontSize: "0.875rem",
            textAlign: "center",
          }}
        >
          {walletState.error}
        </Box>
      )}
    </WalletButtonContainer>
  );
};

const Header: FC = () => {
  const [visibleMenu, setVisibleMenu] = useState<boolean>(false);
  const { breakpoints } = useTheme();
  const dispatch = useAppDispatch();
  const username = useAppSelector(selectLoginUser);
  const navigate = useNavigate();

  const matchMobileView = useMediaQuery(breakpoints.down("lg"));

  return (
    <Box sx={{ backgroundColor: "#173039" }}>
      <Container
        sx={{
          [breakpoints.up("sm")]: {
            maxWidth: "1400px",
          },
          pt: "30px",
          pb: "8px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />
          <Box sx={{ ml: "auto", display: { md: "inline-flex", lg: "none" } }}>
            <IconButton onClick={() => setVisibleMenu(!visibleMenu)}>
              <Menu />
            </IconButton>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: { xs: "column", lg: "row" },
              transition: (theme) => theme.transitions.create(["top"]),
              ...(matchMobileView && {
                py: 6,
                backgroundColor: "background.paper",
                zIndex: "appBar",
                position: "fixed",
                height: { xs: "100vh", lg: "auto" },
                top: visibleMenu ? 0 : "-120vh",
                left: 0,
              }),
            }}
          >
            <Box />
            <Navigation />
            <ConnectWalletButton />
            {visibleMenu && matchMobileView && (
              <IconButton
                sx={{
                  position: "fixed",
                  top: 10,
                  right: 10,
                }}
                onClick={() => setVisibleMenu(!visibleMenu)}
              >
                <Close />
              </IconButton>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Header;
