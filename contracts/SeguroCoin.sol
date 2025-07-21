// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SeguroCoin is ERC20 {
    address public owner;

    // Los eventos son como "huellas digitales" en la blockchain. Permiten rastrear acciones
    event TransferenciaSegura(address indexed from, address indexed to, uint256 value);

    // CONSTRUCTOR: Se ejecuta SOLO UNA VEZ al crear el contrato 
    constructor () ERC20("SeguroCoin", "SCO") {
        owner = msg.sender; // msg.sender = quien despliega el contrato
        _mint(msg.sender, 1000 * 10 ** decimals()); // Crea 1000 tokens        
    }

    // FUNCIÓN TRANSFER: Para enviar tokens
    function transfer(address to, uint256 amount) public override returns (bool) {
        // REGLA 1: 'to' Verificar que no se está enviando a la misma dirección
        require(msg.sender != to, "No se puede enviar a la misma direccion");
        
        // REGLA 2: 'to' no puede ser dirección cero (0x0)
        require(to != address(0), "Direccion invalida");

        //REGLA 3: La cantidad debe ser positiva
        require(amount > 0, "Cantidad debe ser positiva");

        // REGLA 4: El remitente debe tener suficientes tokens
        require(balanceOf(msg.sender) >= amount, "Saldo insuficiente");

        // Si pasa todas las reglas, ejecuta la transferencia
        _transfer(msg.sender, to, amount);
        // Emitir evento
        emit TransferenciaSegura(msg.sender, to, amount);
        return true;
    }
}