<?php

test('two factor settings page can be rendered', function () {
    $this->markTestSkipped('Our application does not use the default Laravel Fortify two-factor authentication.');
});

test('two factor settings page requires password confirmation when enabled', function () {
    $this->markTestSkipped('Our application does not use the default Laravel Fortify two-factor authentication.');
});

test('two factor settings page does not requires password confirmation when disabled', function () {
    $this->markTestSkipped('Our application does not use the default Laravel Fortify two-factor authentication.');
});

test('two factor settings page returns forbidden response when two factor is disabled', function () {
    $this->markTestSkipped('Our application does not use the default Laravel Fortify two-factor authentication.');
});
