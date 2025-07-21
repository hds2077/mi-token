const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SeguroCoin", function () {
  let token; // Nuestro contrato
  let owner, user1; // Direcciones de prueba

  // PREPARACIÓN: Antes de cada prueba
  beforeEach(async function () {
    // Obtenemos cuentas de prueba
    [owner, user1] = await ethers.getSigners();
    
    // Desplegamos el contrato
    const Token = await ethers.getContractFactory("SeguroCoin");
    token = await Token.deploy();
  });

  // PRUEBA 1: Verificar que no se está enviando a la misma dirección
  it("Debería bloquear transfer a la misma dirección", async function () {
    // 1. Obtener la dirección del owner (msg.sender)
    const ownerAddress = await owner.getAddress();

    // 2. Intentar transferir tokens a sí mismo
    await expect(
      token.connect(owner).transfer(ownerAddress, 100)
    ).to.be.revertedWith("No se puede enviar a la misma direccion");
  });

  // PRUEBA 2: Nombre y símbolo correcto
  it("Debería tener nombre 'SeguroCoin' y símbolo 'SCO'", async function () {
    expect(await token.name()).to.equal("SeguroCoin");
    expect(await token.symbol()).to.equal("SCO");
  });

  // PRUEBA 3: Bloquear transferencia a dirección inválida
  it("Debería bloquear transfer a address(0)", async function () {
    await expect(
      token.transfer("0x0000000000000000000000000000000000000000", 100)
    ).to.be.revertedWith("Direccion invalida");
  });

  // PRUEBA 4: Bloquear transferencia sin fondos
  it("No debería permitir transferir más tokens de los que se tiene", async function () {
    // 1. Obtener balance completo del owner
    const ownerBalance = await token.balanceOf(owner.address);
    
    // 2. Calcular cantidad inválida (balance + 1 unidad)
    const invalidAmount = ownerBalance + 1n; // Usamos BigInt
    
    // 3. Intentar transferir MÁS de lo que tiene
    await expect(
      token.transfer(user1.address, invalidAmount)
    ).to.be.revertedWith("Saldo insuficiente"); // ← Ahora sí fallará
  });

  // PRUEBA 5: Debería tener 18 decimales
  it("Debería tener 18 decimales", async function () {
    expect(await token.decimals()).to.equal(18);
  });

  // PRUEBA 6: Debería tener 1000 tokens iniciales
  it("Debería tener 1000 tokens iniciales", async function () {
    const totalSupply = await token.totalSupply();
    // 1000 tokens * 10^18
    expect(totalSupply).to.equal(1_000n * 10n**18n); 
  });

  // PRUEBA 7: Debería emitir evento TransferenciaSegura
  it("Debería emitir evento TransferenciaSegura", async function () {
  await expect(token.transfer(user1.address, 50))
    .to.emit(token, "TransferenciaSegura")
    .withArgs(owner.address, user1.address, 50);
  });

});