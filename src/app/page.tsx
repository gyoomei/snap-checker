import { MiniApp } from "@/features/app/mini-app";
import { Web3Provider } from "@/providers/web3-provider";

export default function Home() {
  return (
    <Web3Provider>
      <MiniApp />
    </Web3Provider>
  );
}
