package com.qret.mbd;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private static final String[] CANDIDATES = {
            "http://qret.et",
            "http://qret.local",
            "http://192.168.1.13:3000"
    };

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private FrameLayout splashView;
    private ProgressBar splashProgress;
    private TextView splashText;
    private LinearLayout errorView;
    private EditText urlInput;
    private int candidateIndex = 0;
    private boolean loadFailed = false;
    private boolean everLoaded = false;
    private ValueCallback<Uri[]> filePathCallback;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        splashView = findViewById(R.id.splashView);
        splashProgress = findViewById(R.id.splashProgress);
        splashText = findViewById(R.id.splashText);
        errorView = findViewById(R.id.errorView);
        urlInput = findViewById(R.id.urlInput);
        Button retryBtn = findViewById(R.id.retryBtn);
        Button useAddressBtn = findViewById(R.id.useAddressBtn);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " QretApp/1.2");

        // Always start with a clean slate so stale service-worker / page caches
        // can never serve old code again.
        webView.clearCache(true);
        webView.clearHistory();
        webView.clearFormData();
        webView.setBackgroundColor(0xFF0D0E11);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (loadFailed) {
                    loadFailed = false;
                    loadNextCandidate();
                    return;
                }
                everLoaded = true;
                splashView.setVisibility(View.GONE);
                errorView.setVisibility(View.GONE);
                splashProgress.setVisibility(View.GONE);
                splashText.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                if (!request.isForMainFrame()) return;
                int code = error.getErrorCode();
                // These fire during normal navigations/redirects/form posts — NOT real failures
                if (code == -3 || code == -101) return; // ERROR_ABORTED, ERROR_CACHE_MISS
                if (!everLoaded) {
                    // Still connecting — move to the next server candidate
                    loadFailed = true;
                } else {
                    // Already connected before — never reload on its own, just show a retry screen
                    runOnUiThread(() -> {
                        splashView.setVisibility(View.GONE);
                        errorView.setVisibility(View.VISIBLE);
                    });
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                try {
                    startActivityForResult(intent, 9001);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        // Native clipboard bridge: the web page calls window.QretBridge.copyText(text)
        // and Android copies via the system clipboard — cannot be blocked by the browser.
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public boolean copyText(String text) {
                try {
                    ClipboardManager cm = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                    cm.setPrimaryClip(ClipData.newPlainText("Qret", text == null ? "" : text));
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }
        }, "QretBridge");

        // Pull-to-refresh is disabled in the app shell because it causes unnecessary reloads
        // and interrupts the customer payment-copy flow. The app should remain stable while
        // the web experience handles its own navigation and copy actions.
        swipeRefresh.setEnabled(false);
        swipeRefresh.setOnRefreshListener(() -> swipeRefresh.setRefreshing(false));

        retryBtn.setOnClickListener(v -> {
            candidateIndex = 0;
            loadNextCandidate();
        });

        useAddressBtn.setOnClickListener(v -> {
            String url = urlInput.getText().toString().trim();
            if (url.isEmpty()) {
                Toast.makeText(this, "Enter a server address", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "http://" + url;
            }
            loadUrl(url);
        });

        loadNextCandidate();
    }

    private void loadNextCandidate() {
        if (candidateIndex < CANDIDATES.length) {
            String url = CANDIDATES[candidateIndex++];
            splashText.setText(getString(R.string.connecting) + " " + url);
            splashView.setVisibility(View.VISIBLE);
            errorView.setVisibility(View.GONE);
            loadUrl(url);
        } else {
            splashView.setVisibility(View.GONE);
            errorView.setVisibility(View.VISIBLE);
        }
    }

    private void loadUrl(String url) {
        webView.stopLoading();
        webView.loadUrl(url);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        if (requestCode == 9001) {
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                if (data.getData() != null) {
                    results = new Uri[]{data.getData()};
                } else if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}