package com.library.Service;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class Utils {
    static String removeDiacriticsAndSpecialCases(String str) {
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").replace('đ', 'd').replace('Đ', 'D');
    }

    public static void main(String[] args) {
        String original = "Bách khoa, bác học";
        String result = removeDiacriticsAndSpecialCases(original);
        System.out.println("Original: " + original);
        System.out.println("Without Diacritics: " + result);
    }
}