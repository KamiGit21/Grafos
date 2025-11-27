% abrir_fuzzy.m
% Este script abre el Fuzzy Logic Designer
try
    fuzzy; % o fuzzyLogicDesigner si tu versión es nueva
catch ME
    disp("Error al abrir Fuzzy Logic Designer:")
    disp(ME.message)
end
