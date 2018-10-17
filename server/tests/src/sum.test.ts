function suma(x, y) {
    return x + y;
}
test('suma de 2+1 debe ser 3', () => {
    expect(suma(2, 1)).toBe(3);
});
