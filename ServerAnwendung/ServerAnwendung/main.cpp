#include <iostream>
#include <WS2tcpip.h>
#include <urlmon.h>

#pragma comment (lib, "ws2_32.lib")
#pragma comment (lib, "urlmon.lib")

//Example Gamehooking function
/*
void hookGameChangeValue(int value) {
	DWORD pid;

	HWND hWnd = FindWindow(0, L"Stardew Valley");

	LPVOID addrInGameTime = (LPVOID)0x7FFCDEC55020;

	GetWindowThreadProcessId(hWnd, &pid);
	HANDLE pHandle = OpenProcess(PROCESS_ALL_ACCESS, 0, pid);

	WriteProcessMemory(pHandle, addrInGameTime, &value, sizeof(value), 0);
}
*/

//Function for setting the Desktop Wallpaper
void setWallpaper(char* url) {
	TCHAR tmpPath[MAX_PATH];
	TCHAR tmpFile[MAX_PATH];

	GetTempPath(MAX_PATH, tmpPath);
	GetTempFileName(tmpPath,L"COR",1,tmpFile);

	std::cout << tmpPath << std::endl;
	std::cout << tmpFile << std::endl;

	wchar_t wUrl[NI_MAXHOST];
	mbstowcs_s(0,wUrl, url, strlen(url) + 1);
	LPWSTR ptr = wUrl;

	std::cout << wUrl << std::endl;
	std::cout << ptr << std::endl;

	URLDownloadToFile(NULL, wUrl, tmpFile, 0, NULL);
	SystemParametersInfo(SPI_SETDESKWALLPAPER, 0, (void*)tmpFile, SPIF_UPDATEINIFILE);
}

void main() {
	WSADATA wsData;
	WORD ver MAKEWORD(2,2);

	//Error checking
	int wsOk = WSAStartup(ver,&wsData);
	if (wsOk != 0) {
		std::cout << "Windsock init error.." << std::endl;
		return;
	}

	SOCKET listening = socket(AF_INET, SOCK_STREAM, 0);
	if (listening == INVALID_SOCKET) {
		std::cout << "INVALID SOCKET - Listining" << std::endl;
		return;
	}

	//Connection configuration
	sockaddr_in hint;
	hint.sin_family = AF_INET;
	hint.sin_port = htons(54000);
	hint.sin_addr.S_un.S_addr = INADDR_ANY;

	//Binding the port and establishing the connection
	bind(listening, (sockaddr*)&hint, sizeof(hint));

	listen(listening, SOMAXCONN);

	sockaddr_in client;
	int clientSize = sizeof(client);

	SOCKET clientSocket = accept(listening, (sockaddr*)&client,&clientSize);
	if (clientSocket == INVALID_SOCKET) {
		std::cout << "INVALID SOCKET - Client" << std::endl;
		return;
	}

	char host[NI_MAXHOST];
	char service[NI_MAXHOST];

	ZeroMemory(host, NI_MAXHOST);
	ZeroMemory(service, NI_MAXHOST);

	if (getnameinfo((sockaddr*)&client,sizeof(client),host,NI_MAXHOST,service,NI_MAXHOST,0) == 0) {
		std::cout << host << " connected to service on port: " << service << std::endl;
	}
	else
	{
		inet_ntop(AF_INET, &client.sin_addr, host, NI_MAXHOST);
		std::cout << host << " connected to service on port: " << ntohs(client.sin_port) << std::endl;
	}

	closesocket(listening);

	char buf[4096];
	
	//while connected
	while (true) {
		ZeroMemory(buf, 4096);

		int bytesRecieved = recv(clientSocket,buf,4096,0);
		if (bytesRecieved == SOCKET_ERROR) {
			std::cerr << "Error in recv() -> Exiting.." << std::endl;
			break;
		}

		if (bytesRecieved == 0) {
			std::cout << "Client disconnected" << std::endl;
			break;
		}

		//Testing|Examples what the client recieves
		std::cout << buf << std::endl;
		std::cout << (buf + 2) << std::endl;

		/*
			The server is choosing an option based on the first digit in the buffer and
			the rest in the buffer is then being used for arguments to call and execute local functions
		*/
		
		if(buf[0] == '1')
		//hookGameChangeValue(atoi(buf+2));
		if(buf[0] == '2')
			setWallpaper((buf+2));

		//send(clientSocket, buf, bytesRecieved + 1, 0);
	}
	closesocket(clientSocket);
	WSACleanup();
}